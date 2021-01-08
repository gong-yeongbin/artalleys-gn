import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("post_status")
@Unique(["status"])
export default class PostStatus {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "status", type: "nvarchar" })
  status: string;
}
