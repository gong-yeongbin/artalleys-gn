import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";

@Entity("post_condition")
@Unique(["conditions"])
export default class PostCondition {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "conditions", type: "nvarchar" })
  conditions: string;
}
