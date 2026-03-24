"use client";

import { FlagTriangleRight, ChevronRightIcon } from "lucide-react";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from "./ui/item";
import Link from "next/link";

export interface ItemSectionsItems {
  href?: string;
  icons?: React.ReactElement;
  title?: string;
  description?: string;
  disabled?: boolean;
}

export interface ItemSectionsProps {
  sectionHeader?: string;
  sectionDescription?: string;
  items?: ItemSectionsItems[];
}

export function ItemSections(props: ItemSectionsProps) {
  return (
    <>
      <div className="col-span-12">
        <h3 className="text-xl font-bold">
          {props.sectionHeader ?? "Getting Started"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {props.sectionDescription ??
            "A quick guide to get you started to make your project came through"}
        </p>
      </div>
      {props.items &&
        props.items.map((item, index) => (
          <Item
            key={index}
            variant="outline"
            size="sm"
            className={`relative col-span-12 md:col-span-6 lg:col-span-4 w-full ${item.disabled ? "opacity-50 cursor-not-allowed" : "hover:cursor-pointer hover:bg-muted"}`}
          >
            <Link
              href={item.href ?? "#"}
              className={`flex flex-1 gap-2 ${item.disabled ? "cursor-not-allowed" : "hover:cursor-pointer"}`}
            >
              <ItemMedia>
                {item.icons ?? <FlagTriangleRight className="size-9" />}
              </ItemMedia>
              <ItemContent className="gap-0">
                <ItemTitle>{item.title ?? ""}</ItemTitle>
                <ItemDescription className="text-xs">
                  {item.description ?? ""}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <ChevronRightIcon className="size-4" />
              </ItemActions>
            </Link>
          </Item>
        ))}
    </>
  );
}
