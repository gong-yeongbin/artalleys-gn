import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("report_category")
export default class ReportCategory {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "category", type: "nvarchar" })
  category: string;
}
