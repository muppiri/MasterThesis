import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Papers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, length: 1000 })
  title: string;

  @Column({ nullable: true, length: 1000 })
  authors: string;

  @Column({ nullable: true, length: 1000 })
  venue: string;

  @Column({ nullable: true, length: 1000 })
  doi: string;

  @Column({ type: "year", nullable: true })
  publishedYear: string;

  @Column({ nullable: true })
  abstract: string;
}
