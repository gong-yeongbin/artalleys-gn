import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("image")
export default class Image {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "url", type: "nvarchar" })
  url: string;
}
