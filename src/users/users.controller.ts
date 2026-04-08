import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
} from "@nestjs/common";
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: "Create a user" })
  @ApiCreatedResponse({ description: "User created successfully" })
  @ApiConflictResponse({ description: "Email already exists" })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: "List users" })
  @ApiOkResponse({ description: "User list returned successfully" })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a user by id" })
  @ApiOkResponse({ description: "User returned successfully" })
  @ApiNotFoundResponse({ description: "User not found" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    const user = await this.usersService.findOne(id);

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return user;
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a user by id" })
  @ApiNoContentResponse({ description: "User deleted successfully" })
  @ApiNotFoundResponse({ description: "User not found" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    const deleted = await this.usersService.remove(id);

    if (!deleted) {
      throw new NotFoundException(`User ${id} not found`);
    }
  }
}
