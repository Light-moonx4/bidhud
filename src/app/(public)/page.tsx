import Link from 'next/link';
import Image from 'next/image';

interface Auction {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  currentPrice: string;
  closingDate: string;
  category: { name: string; slug: string };
  seller: { name: string };
  _count: { bids: number };
}

async function getAuctions(): Promise<Auction[]> {
  try {
    // Nota: En Server Components puedes hacer fetch directo a tu API interna
    const res = await fetch('http://localhost:3000/api/auctions', {
      cache: 'no-store', // Para asegurar datos en tiempo real
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.auctions || [];
  } catch (error) {
    console.error('Error fetching auctions:', error);
    return [];
  }
}

export default async function AuctionsPage() {
  const auctions = await getAuctions();

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">BidHub - Subastas Activas</h1>
            <p className="mt-2 text-sm text-gray-600">Explora y puja en tiempo real por los mejores artículos.</p>
          </div>
          <Link
            href="/private/auctions/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Crear Subasta
          </Link>
        </div>

        {auctions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg">No hay subastas activas en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
              <div
                key={auction.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition flex flex-col"
              >
                <div className="relative h-48 w-full bg-gray-100">
                  <Image
                    src={auction.imageUrl}
                    alt={auction.title}
                    fill
                    className="object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-indigo-600 text-white text-xs px-2.5 py-1 rounded-full font-semibold">
                    {auction.category.name}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 line-clamp-1">{auction.title}</h2>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">{auction.description}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500 block">Precio Actual</span>
                      <span className="text-lg font-bold text-indigo-600">${auction.currentPrice}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500 block">Ofertas</span>
                      <span className="text-sm font-semibold text-gray-800">{auction._count.bids} pujas</span>
                    </div>
                  </div>

                  <Link
                    href={`/auctions/${auction.id}`}
                    className="mt-4 w-full block text-center bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition"
                  >
                    Ver Subasta y Pujar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}