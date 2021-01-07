import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("business_image")
export default class BusinessImage {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "url", type: "nvarchar" })
  url: string;
}
