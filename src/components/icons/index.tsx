import { type SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function icon(name: string, size = 18) {
  return function Icon(props: IconProps) {
    const { size: s = size, className = "", ...rest } = props;
    return (
      <svg
        width={s}
        height={s}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`shrink-0 ${className}`}
        {...rest}
      >
        <use href={`/icons.svg#${name}`} />
      </svg>
    );
  };
}

export const InboxIcon = icon("inbox");
export const CalendarIcon = icon("calendar");
export const ClockIcon = icon("clock");
export const PlusIcon = icon("plus");
export const TrashIcon = icon("trash");
export const ChevronDown = icon("chevron-down");
export const ChevronRight = icon("chevron-right");
export const ChevronLeft = icon("chevron-left");
export const SettingsIcon = icon("settings");
export const SearchIcon = icon("search");
export const ArchiveIcon = icon("archive");
export const FlagIcon = icon("flag");
export const TagIcon = icon("tag");
export const MoreHorizontal = icon("more-horizontal");
export const XIcon = icon("x");
export const CheckIcon = icon("check");
export const CheckCircle = icon("check-circle");
export const CircleIcon = icon("circle");
export const RefreshIcon = icon("refresh");
export const SunIcon = icon("sun");
export const MoonIcon = icon("moon");
export const FilterIcon = icon("filter");
export const BarChart = icon("bar-chart");
export const LayoutIcon = icon("layout");
export const ListIcon = icon("list");
export const ExternalIcon = icon("external-link");
export const InfoIcon = icon("info");
export const AlertIcon = icon("alert");
