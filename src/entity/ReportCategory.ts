import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Report } from "./Entity";

@Entity("report_category")
export default class ReportCategory {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "category", type: "nvarchar" })
  category: string;

  @OneToMany(() => Report, (report) => report.id)
  @JoinColumn({ name: "report" })
  report: Report;
}
