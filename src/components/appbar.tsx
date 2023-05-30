import Link from 'next/link';

export default function Appbar() {

  return (<>

    <header className="relative flex h-16 flex-shrink-0 items-center bg-gray-800">
      <div className="absolute inset-y-0 left-0 lg:static lg:flex-shrink-0">
        <Link
          href="/#"
          className="flex h-16 w-20 items-center justify-center bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600">
          B-viz
        </Link>
      </div>
    </header>
  </>);
}