import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreatePropertyDto, QueryPropertyDto, UpdatePropertyDto } from './dto/property.dto';

@ApiTags('properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly service: PropertiesService) {}

  @Public()
  @Get()
  findAll(@Query() q: QueryPropertyDto) {
    return this.service.findAll(q);
  }

  @Public()
  @Get('search')
  search(@Query('q') q: string) {
    return this.service.search(q || '');
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiBearerAuth()
  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreatePropertyDto) {
    return this.service.create(userId, dto);
  }

  @ApiBearerAuth()
  @Put(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
  ) {
    return this.service.update(userId, id, dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.remove(userId, id);
  }
}
