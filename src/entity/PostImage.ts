import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("post_image")
export default class PostImage {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "url", type: "nvarchar" })
  url: string;
}
