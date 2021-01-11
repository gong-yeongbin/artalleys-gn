import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Post } from "../entity/Entity";

@Entity("location")
export default class Location {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "longitude", type: "float" })
  longitude: number;

  @Column({ name: "latitude", type: "float" })
  latitude: number;
}
