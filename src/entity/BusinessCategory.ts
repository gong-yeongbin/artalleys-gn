import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Unique,
  JoinColumn,
} from "typeorm";
import { Business } from "./Entity";

@Entity("business_category")
@Unique(["category"])
export default class BusinessCategory {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "category", type: "nvarchar" })
  category: string;

  @OneToMany(() => Business, (business) => business.id)
  @JoinColumn({ name: "business" })
  business: Business;
}
