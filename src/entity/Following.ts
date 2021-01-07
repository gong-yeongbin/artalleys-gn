import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("following")
export default class Followers {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "following_id", type: "bigint" })
  followingId: number;
}
