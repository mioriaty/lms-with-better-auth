import { ChartAreaInteractive } from '@/libs/components/dashboard-sidebar/chart-area-interactive';
import { DataTable } from '@/libs/components/dashboard-sidebar/data-table';
import { SectionCards } from '@/libs/components/dashboard-sidebar/section-cards';

import data from './data.json';

export default function AdminIndexPage() {
  
  return (
    <>
      <SectionCards />
      <ChartAreaInteractive />
      <DataTable data={data} />
    </>
  );
}
