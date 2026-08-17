import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ReportTable({ headers, rows = [] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {headers.map((header) => (
            <TableHead className="text-center" key={header.key}>
              {header.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length > 0 ? (
          rows.map((row, index) => (
            <TableRow key={row.id ?? index}>
              {headers.map((header) => (
                <TableCell key={header.key} className="text-center">
                  {header.render ? header.render(row) : row[header.key]}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={headers.length}
              className="h-24 text-center text-muted-foreground"
            >
              No records found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
