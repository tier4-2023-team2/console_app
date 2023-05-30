"use client";
import {
  WrenchScrewdriverIcon,
  VariableIcon,
  TruckIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';

const sidebarNavigation = [
  { name: 'System', href: '/config', icon: WrenchScrewdriverIcon, match: "config" },
  { name: 'Vehicle', href: '/vehicle', icon: TruckIcon, match: "vehicle" },
  { name: 'Tree', href: '/tree', icon: VariableIcon, match: "tree" },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}
export default function NarrowSideBar() {

  const segment = useSelectedLayoutSegment();
  return (<>
    <nav aria-label="Sidebar" className="block flex-shrink-0 overflow-y-auto bg-gray-800">
      <div className="relative flex w-20 flex-col space-y-3 p-3">
        {sidebarNavigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={classNames(
              item.match === segment ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-700',
              'flex-shrink-0 inline-flex items-center justify-center h-14 w-14 rounded-lg'
            )}
          >
            <span className="sr-only">{item.name}</span>
            <item.icon className="h-6 w-6" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </nav>
  </>);
}