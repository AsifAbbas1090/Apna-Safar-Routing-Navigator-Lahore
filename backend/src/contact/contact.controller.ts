import { Controller, Post, Body } from '@nestjs/common';
import { ContactService } from './contact.service';
import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

class ContactDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  to: string;
}

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async sendContactEmail(@Body() contactDto: ContactDto) {
    return this.contactService.sendEmail(contactDto);
  }
}

