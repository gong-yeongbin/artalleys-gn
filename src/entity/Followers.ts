import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("followers")
export default class Followers {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "followers_id", type: "bigint" })
  flollowersId: number;
}
