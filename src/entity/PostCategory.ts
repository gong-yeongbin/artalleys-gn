import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";

@Entity("post_category")
@Unique(["category"])
export default class PostCategory {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "category", type: "nvarchar" })
  category: string;
}
