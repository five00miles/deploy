import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Check service health' })
  @ApiOkResponse({
    description: 'Service is running',
    schema: {
      example: { status: 'ok' },
    },
  })
  check() {
    return { status: 'ok' };
  }
}
