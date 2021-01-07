import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("post_condition")
export default class PostCondition {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "condition", type: "nvarchar" })
  condition: string;
}
