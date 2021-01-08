import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("image_type")
export default class ImageType {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "url", type: "nvarchar" })
  type: string;
}
