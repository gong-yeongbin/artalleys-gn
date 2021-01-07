import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("Entity")
export default class LikeType {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "type", type: "nvarchar" })
  type: string;
}
