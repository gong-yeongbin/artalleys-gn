import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("post_type")
export default class PostType {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "type", type: "nvarchar" })
  type: string;
}
