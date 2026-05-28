import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PhotoGallery } from "./PhotoGallery";
import type { StoreItemImage } from "@/lib/store-api/types";

// Mock the hooks module so no QueryClient / ShopProvider is needed
vi.mock("@/lib/store-api/hooks", () => {
  const mutateFn = vi.fn();
  const makeMutation = () => ({ mutate: mutateFn, isPending: false });
  return {
    useUploadImage: vi.fn(() => makeMutation()),
    usePatchImage: vi.fn(() => makeMutation()),
    useDeleteImage: vi.fn(() => makeMutation()),
  };
});

// Prevent resolveCatalogAsset from throwing in jsdom
vi.mock("@/lib/api/env", () => ({
  BASES: { catalog: "http://localhost:8002", core: "", generation: "" },
  resolveCatalogAsset: (p: string | null | undefined) =>
    p ? `http://localhost:8002${p.startsWith("/") ? p : `/${p}`}` : null,
  resolveGenerationAsset: (p: string | null | undefined) => p ?? null,
}));

import * as hooks from "@/lib/store-api/hooks";

const img1: StoreItemImage = { id: "img1", url: "/storage/a.jpg", is_main: true, role: "catalog", sort_order: 0, variant_id: null };
const img2: StoreItemImage = { id: "img2", url: "/storage/b.jpg", is_main: false, role: "catalog", sort_order: 1, variant_id: null };
const img3: StoreItemImage = { id: "img3", url: "/storage/c.jpg", is_main: false, role: "catalog", sort_order: 2, variant_id: null };
const img4: StoreItemImage = { id: "img4", url: "/storage/d.jpg", is_main: false, role: "catalog", sort_order: 3, variant_id: null };

const noop = () => {};

describe("PhotoGallery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows drop-zone when images.length < max", () => {
    render(<PhotoGallery itemId="i1" variantId={null} images={[img1, img2]} max={4} onChanged={noop} />);
    expect(screen.getByLabelText("Добавить фото")).toBeInTheDocument();
  });

  it("hides drop-zone when images.length === max", () => {
    render(<PhotoGallery itemId="i1" variantId={null} images={[img1, img2, img3, img4]} max={4} onChanged={noop} />);
    expect(screen.queryByLabelText("Добавить фото")).not.toBeInTheDocument();
  });

  it("rejects a .gif file with an inline error and no upload call", () => {
    const uploadMutate = vi.fn();
    vi.mocked(hooks.useUploadImage).mockReturnValue({ mutate: uploadMutate, isPending: false } as any);

    render(<PhotoGallery itemId="i1" variantId={null} images={[img1]} max={4} onChanged={noop} />);

    const input = screen.getByTestId("photo-file-input");
    const gif = new File(["x"], "anim.gif", { type: "image/gif" });
    fireEvent.change(input, { target: { files: [gif] } });

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(uploadMutate).not.toHaveBeenCalled();
  });

  it("rejects a file larger than 8 MB with an inline error and no upload call", () => {
    const uploadMutate = vi.fn();
    vi.mocked(hooks.useUploadImage).mockReturnValue({ mutate: uploadMutate, isPending: false } as any);

    render(<PhotoGallery itemId="i1" variantId={null} images={[img1]} max={4} onChanged={noop} />);

    const input = screen.getByTestId("photo-file-input");
    const bigBuffer = new ArrayBuffer(9 * 1024 * 1024);
    const big = new File([bigBuffer], "big.jpg", { type: "image/jpeg" });
    fireEvent.change(input, { target: { files: [big] } });

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(uploadMutate).not.toHaveBeenCalled();
  });

  it("calls upload mutate with a valid jpeg file", () => {
    const uploadMutate = vi.fn();
    vi.mocked(hooks.useUploadImage).mockReturnValue({ mutate: uploadMutate, isPending: false } as any);

    render(<PhotoGallery itemId="i1" variantId="v1" images={[img1]} max={4} onChanged={noop} />);

    const input = screen.getByTestId("photo-file-input");
    const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(uploadMutate).toHaveBeenCalledWith(
      expect.objectContaining({ file, variant_id: "v1", is_main: false }),
      expect.any(Object),
    );
  });

  it("first upload for variant sets is_main: true", () => {
    const uploadMutate = vi.fn();
    vi.mocked(hooks.useUploadImage).mockReturnValue({ mutate: uploadMutate, isPending: false } as any);

    render(<PhotoGallery itemId="i1" variantId={null} images={[]} max={4} onChanged={noop} />);

    const input = screen.getByTestId("photo-file-input");
    const file = new File(["data"], "first.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(uploadMutate).toHaveBeenCalledWith(
      expect.objectContaining({ is_main: true }),
      expect.any(Object),
    );
  });

  it("set-main button calls patchImage mutate", () => {
    const patchMutate = vi.fn();
    vi.mocked(hooks.usePatchImage).mockReturnValue({ mutate: patchMutate, isPending: false } as any);

    render(<PhotoGallery itemId="i1" variantId={null} images={[img1, img2]} max={4} onChanged={noop} />);

    const starButtons = screen.getAllByLabelText("Главное фото");
    // Click the star on the second image (img2, not main)
    fireEvent.click(starButtons[1]);
    expect(patchMutate).toHaveBeenCalledWith(
      { img_id: "img2", body: { is_main: true } },
      expect.any(Object),
    );
  });

  it("delete button calls deleteImage mutate", () => {
    const deleteMutate = vi.fn();
    vi.mocked(hooks.useDeleteImage).mockReturnValue({ mutate: deleteMutate, isPending: false } as any);

    render(<PhotoGallery itemId="i1" variantId={null} images={[img1, img2]} max={4} onChanged={noop} />);

    const deleteButtons = screen.getAllByLabelText("Удалить фото");
    fireEvent.click(deleteButtons[0]);
    expect(deleteMutate).toHaveBeenCalledWith("img1", expect.any(Object));
  });
});
