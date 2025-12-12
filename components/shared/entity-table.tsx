// file: components/shared/entity-table.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: "left" | "right" | "center";
}

interface EntityTableProps<T extends { id: string }> {
  columns: TableColumn[];
  data: T[];
  onRowClick?: (item: T) => void;
  selectedId?: string;
  renderCell: (item: T, columnKey: string) => React.ReactNode;
  emptyState?: React.ReactNode;
}

export function EntityTable<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  selectedId,
  renderCell,
  emptyState,
}: EntityTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <div className="py-12">{emptyState}</div>;
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                style={{ width: column.width }}
                className={cn(
                  column.align === "right" && "text-right",
                  column.align === "center" && "text-center"
                )}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow
              key={item.id}
              className={cn(
                onRowClick && "cursor-pointer",
                selectedId === item.id && "bg-muted"
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={cn(
                    column.align === "right" && "text-right",
                    column.align === "center" && "text-center"
                  )}
                >
                  {renderCell(item, column.key)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
