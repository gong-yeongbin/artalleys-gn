import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("post_status")
export default class PostStatus {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "status", type: "nvarchar" })
  status: string;
}
