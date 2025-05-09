import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User";

@Entity("campaigns")
export class Campaign {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column("text")
    description: string;

    @Column("simple-array")
    options: string[];

    @Column({ nullable: true })
    ageRestriction?: number;

    @Column({ nullable: true })
    countryRestriction?: string;

    @Column("simple-array", { nullable: true })
    whitelist?: string[];

    @ManyToOne(() => User, { eager: true })
    creator: User;

    @Column()
    startTime: Date;

    @Column()
    endTime: Date;

    @Column({ default: 0 })
    numberOfRegisteredVoters: number;

    @Column({ default: 0 })
    numberOfVotes: number;

    @Column("simple-array", { default: [] })
    registeredVoterHashes: string[];

    @Column("simple-array", { default: [] })
    votes: string[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Helper methods
    isActive(): boolean {
        const now = new Date();
        return now >= this.startTime && now <= this.endTime;
    }

    hasStarted(): boolean {
        return new Date() >= this.startTime;
    }

    hasEnded(): boolean {
        return new Date() > this.endTime;
    }

    canRegister(): boolean {
        return !this.hasStarted();
    }

    canVote(): boolean {
        return this.isActive();
    }
} 