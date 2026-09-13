import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  async findAll(includeInactive = false): Promise<Category[]> {
    const query = this.categoryRepo.createQueryBuilder('cat');
    if (!includeInactive) {
      query.where('cat.isActive = :active', { active: true });
    }
    return query.orderBy('cat.name', 'ASC').getMany();
  }

  async findOne(id: string): Promise<Category> {
    const cat = await this.categoryRepo.findOne({ where: { id } });
    if (!cat) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return cat;
  }

  async findBySlug(slug: string): Promise<Category> {
    const cat = await this.categoryRepo.findOne({ where: { slug } });
    if (!cat) {
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }
    return cat;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await this.categoryRepo.findOne({
      where: [{ name: dto.name }, { slug }],
    });
    if (existing) {
      throw new ConflictException('Category with this name or slug already exists');
    }

    const category = this.categoryRepo.create({
      ...dto,
      slug,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });

    return this.categoryRepo.save(category);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    if (dto.name && dto.name !== category.name) {
      const existing = await this.categoryRepo.findOne({
        where: { name: dto.name },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Category with this name already exists');
      }
      category.name = dto.name;
    }

    if (dto.slug && dto.slug !== category.slug) {
      const existing = await this.categoryRepo.findOne({
        where: { slug: dto.slug },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Category with this slug already exists');
      }
      category.slug = dto.slug;
    }

    if (dto.description !== undefined) category.description = dto.description;
    if (dto.icon !== undefined) category.icon = dto.icon;
    if (dto.color !== undefined) category.color = dto.color;
    if (dto.isActive !== undefined) category.isActive = dto.isActive;

    return this.categoryRepo.save(category);
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const category = await this.findOne(id);
    await this.categoryRepo.remove(category);
    return { success: true, message: 'Category removed successfully' };
  }
}
