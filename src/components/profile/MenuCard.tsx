
import Link from "next/link";
type MenuItem = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  href: string;
};

type MenuCardProps = {
  items: MenuItem[];
};

export default function MenuCard({ items }: MenuCardProps) {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm border border-neutral-200">
      {items.map((item, index) => (
        <Link href={item.href} key={index}>
          <div key={index} className="flex items-center justify-between rounded-xl p-3 hover:bg-neutral-50 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100">{item.icon}</div>

              <div>
                <p className="text-sm font-medium text-neutral-800">{item.title}</p>
                <p className="text-xs text-neutral-500">{item.subtitle}</p>
              </div>
            </div>

            <span className="text-neutral-400">›</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
