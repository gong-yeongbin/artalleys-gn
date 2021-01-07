import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("user_image")
export default class UserImage {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "url", type: "nvarchar" })
  url: string;
}
