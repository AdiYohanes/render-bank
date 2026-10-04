import { PublicFooter, PublicHeader } from "@/app/components/public-shell";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <><PublicHeader />{children}<PublicFooter /></>;
}
