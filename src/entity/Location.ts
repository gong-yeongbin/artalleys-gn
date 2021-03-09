import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Business, Post } from "../entity/Entity";

@Entity("location")
export default class Location {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "longitude", type: "float" })
  longitude: number;

  @Column({ name: "latitude", type: "float" })
  latitude: number;

  @Column({ name: "address", type: "float" })
  city: string;

  @OneToOne(() => Post, (post) => post.location, {
    cascade: true,
    onDelete: "CASCADE",
  })
  post: Post;

  @OneToOne(() => Business, (business) => business.location, {
    cascade: true,
    onDelete: "CASCADE",
  })
  business: Business;
}
