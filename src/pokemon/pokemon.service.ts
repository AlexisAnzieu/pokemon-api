import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Pokemon, Prisma } from '@prisma/client';
import { PokemonAlreadyExistsError } from './errors/PokemonAlreadyExists.error';
import { PokemonDoesntExistError } from './errors/PokemonDoesntExist.error';

// tu peux eviter le premier call "count" en utilisant en catchant l'erreur RecordNotFound

@Injectable()
export class PokemonService {
  constructor(private prismaService: PrismaService) {}

  // peut etre fusionner create et update avec la function "upsert https://www.prisma.io/docs/concepts/components/prisma-client/crud#update-or-create-records"
  async create(createInput: Prisma.PokemonCreateInput) {
    const count = await this.prismaService.pokemon.count({
      where: { name: createInput.name },
    });
    if (count > 0) {
      throw new PokemonAlreadyExistsError();
    }
    return this.prismaService.pokemon.create({ data: createInput });
  }

  async findAll(query: Prisma.PokemonFindManyArgs) {
    const take = query.take || 10;
    const skip = query.skip || 0;

    return this.prismaService.pokemon.findMany({
      skip,
      take,
    });
  }

  async findOne(where: Prisma.PokemonWhereUniqueInput): Promise<Pokemon> {
    const count = await this.prismaService.pokemon.count({ where });
    if (count === 0) {
      throw new PokemonDoesntExistError();
    }

    return this.prismaService.pokemon.findUnique({ where });
  }

  async updateOne(
    where: Prisma.PokemonWhereUniqueInput,
    updateInput: Prisma.PokemonUpdateInput,
  ) {
    // je pense que update va trigger une erreur tout seul si il ne peut pas supprimer le pokemon

    const count = await this.prismaService.pokemon.count({ where });
    if (count === 0) {
      throw new PokemonDoesntExistError();
    }

    return this.prismaService.pokemon.update({
      where,
      data: updateInput,
    });
  }

  async deleteOne(where: Prisma.PokemonWhereUniqueInput) {
    // je pense que delete va trigger une erreur tout seul si il ne peut pas supprimer le pokemon
    const count = await this.prismaService.pokemon.count({ where });
    if (count === 0) {
      throw new PokemonDoesntExistError();
    }

    return this.prismaService.pokemon.delete({
      where,
    });
  }
}
