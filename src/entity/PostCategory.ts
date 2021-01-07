import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("post_category")
export default class PostCategory {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "category", type: "nvarchar" })
  category: string;
}
