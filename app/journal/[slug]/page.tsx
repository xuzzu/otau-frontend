import { notFound } from "next/navigation";
import { TopNav } from "@/components/nav/TopNav";
import { ArticleView } from "@/components/journal/ArticleView";
import { ARTICLES, findArticle } from "@/lib/journal";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) notFound();
  return (
    <>
      <TopNav />
      <ArticleView article={article} />
    </>
  );
}
