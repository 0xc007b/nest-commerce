import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { Prisma } from 'generated/prisma';

@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  findAll(@Param('skip', ParseIntPipe) skip: number, @Param('take', ParseIntPipe) take: number, @Param('cursor') cursor: Prisma.CategoryWhereUniqueInput, @Param('where') where: Prisma.CategoryWhereInput, orderBy: Prisma.CategoryOrderByWithRelationInput) {
    return this.categoriesService.findAll({ skip, take, cursor, where, orderBy });
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.categoriesService.findOne({ id });
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update({ id }, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.categoriesService.remove({ id });
  }
}
