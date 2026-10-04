"use client";

import Link from "next/link";
import { Drawer, Dropdown } from "@heroui/react";
import { useState } from "react";

type Category = { id: string; slug: string; name: string };

export function DesktopNav({ categories }: { categories: Category[] }) {
  return (
    <nav aria-label="Main navigation" className="desktop-nav">
      <Link href="/explore">Explore</Link>
      <Dropdown>
        <button className="nav-trigger" type="button">
          Categories
        </button>
        <Dropdown.Popover>
          <Dropdown.Menu>
            {categories.map((category) => (
              <Dropdown.Item
                key={category.id}
                href={`/category/${category.slug}`}
                id={category.slug}
                textValue={category.name}
              >
                {category.name}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
      <Link href="/packs">Packs</Link>
    </nav>
  );
}

export function MobileNav({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="mobile-nav-trigger"
        type="button"
        onClick={() => setOpen(true)}
      >
        Menu
      </button>
      <Drawer.Backdrop isOpen={open} onOpenChange={setOpen}>
        <Drawer.Content placement="right">
          <Drawer.Dialog>
            <Drawer.Header>
              <Drawer.Heading>Menu</Drawer.Heading>
              <Drawer.CloseTrigger />
            </Drawer.Header>
            <Drawer.Body>
              <nav aria-label="Mobile navigation" className="mobile-nav-list">
                <Link href="/explore">Explore</Link>
                <span className="mobile-nav-label">Categories</span>
                {categories.map((category) => (
                  <Link key={category.id} href={`/category/${category.slug}`}>
                    {category.name}
                  </Link>
                ))}
                <Link href="/packs">Packs</Link>
              </nav>
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </>
  );
}
