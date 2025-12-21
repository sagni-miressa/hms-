import { ReactNode } from "react";
import { clsx } from "clsx";

interface TableProps {
  children: ReactNode;
  className?: string;
}

export const Table = ({ children, className }: TableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className={clsx("min-w-full divide-y divide-gray-200", className)}>
        {children}
      </table>
    </div>
  );
};

interface TableHeaderProps {
  children: ReactNode;
}

export const TableHeader = ({ children }: TableHeaderProps) => {
  return (
    <thead className="bg-gray-50">
      <tr>{children}</tr>
    </thead>
  );
};

interface TableHeaderCellProps {
  children: ReactNode;
  className?: string;
}

export const TableHeaderCell = ({
  children,
  className,
}: TableHeaderCellProps) => {
  return (
    <th
      className={clsx(
        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
        className
      )}
    >
      {children}
    </th>
  );
};

interface TableBodyProps {
  children: ReactNode;
}

export const TableBody = ({ children }: TableBodyProps) => {
  return (
    <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
  );
};

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const TableRow = ({ children, className, onClick }: TableRowProps) => {
  return (
    <tr
      className={clsx(
        "hover:bg-gray-50 transition-colors",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

interface TableCellProps {
  children: ReactNode;
  className?: string;
}

export const TableCell = ({ children, className }: TableCellProps) => {
  return (
    <td
      className={clsx(
        "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
        className
      )}
    >
      {children}
    </td>
  );
};
