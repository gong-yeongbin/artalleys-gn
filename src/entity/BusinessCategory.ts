import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("business_category")
export default class BusinessCategory {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "category", type: "nvarchar" })
  category: string;
}
