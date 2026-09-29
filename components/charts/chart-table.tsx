type ChartTableProps = {
  caption: string;
  columns: string[];
  rows: { key: string; cells: string[] }[];
};

/**
 * Table twin of a chart: every value is readable without hovering and
 * without relying on color.
 */
export function ChartTable({ caption, columns, rows }: ChartTableProps) {
  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer text-zinc-500 select-none hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200">
        Show as table
      </summary>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-max">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-zinc-200 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              {columns.map((column, index) => (
                <th
                  key={column}
                  scope="col"
                  className={index === 0 ? "py-1.5 pr-4 text-left font-medium" : "py-1.5 pl-4 text-right font-medium"}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {rows.map((row) => (
              <tr key={row.key}>
                {row.cells.map((cell, index) =>
                  index === 0 ? (
                    <th key={index} scope="row" className="py-1.5 pr-4 text-left font-normal text-zinc-600 dark:text-zinc-400">
                      {cell}
                    </th>
                  ) : (
                    <td key={index} className="py-1.5 pl-4 text-right font-medium text-zinc-900 tabular-nums dark:text-zinc-100">
                      {cell}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
