import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";

@Entity("post_type")
@Unique(["type"])
export default class PostType {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "type", type: "nvarchar" })
  type: string;
}
