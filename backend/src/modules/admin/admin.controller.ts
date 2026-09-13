import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { RejectPostDto } from './dto/admin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/interfaces/jwt-payload.interface';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('moderation/queue')
  async getModerationQueue(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getModerationQueue(page, limit);
  }

  @Patch('moderation/:id/approve')
  async approvePost(@Param('id') id: string) {
    return this.adminService.approvePost(id);
  }

  @Patch('moderation/:id/reject')
  async rejectPost(
    @Param('id') id: string,
    @Body() dto: RejectPostDto,
  ) {
    return this.adminService.rejectPost(id, dto.reason);
  }

  @Get('users')
  async getUsers(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getUsers(search, page, limit);
  }

  @Patch('users/:id/toggle-status')
  async toggleUserStatus(@Param('id') id: string) {
    return this.adminService.toggleUserStatus(id);
  }

  @Get('transactions')
  async getTransactions(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getTransactions(page, limit);
  }
}
