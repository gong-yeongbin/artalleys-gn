import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Post } from "./Post";

@Entity("post_location")
export class PostLocation {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "longtitude", type: "integer" })
  longtitude: number;

  @Column({ name: "latitude", type: "integer" })
  latitude: number;
}
