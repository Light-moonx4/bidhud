export const dynamic = "force-dynamic";

interface AuctionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AuctionDetailPage({ params }: AuctionDetailPageProps) {
  const { id } = await params;

  return (
    <section>
      <h1>Detalle de la subasta</h1>
      <p>ID: {id}</p>
    </section>
  );
}
