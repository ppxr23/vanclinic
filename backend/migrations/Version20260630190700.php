<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260630190700 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SEQUENCE appointments_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE educational_contents_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE feedbacks_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE login_history_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE medical_attachments_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE medical_records_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE mobile_clinic_sessions_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE notifications_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE order_items_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE orders_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE payments_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE products_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE teleexpertise_requests_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE appointments (id INT NOT NULL, patient_id INT NOT NULL, ophthalmologist_id INT DEFAULT NULL, clinic_session_id INT DEFAULT NULL, scheduled_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, duration_minutes INT NOT NULL, type VARCHAR(30) NOT NULL, status VARCHAR(30) NOT NULL, reason TEXT DEFAULT NULL, notes TEXT DEFAULT NULL, location VARCHAR(255) DEFAULT NULL, confirmed_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, cancelled_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, cancellation_reason TEXT DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_6A41727A6B899279 ON appointments (patient_id)');
        $this->addSql('CREATE INDEX IDX_6A41727A3F25AA26 ON appointments (ophthalmologist_id)');
        $this->addSql('CREATE INDEX IDX_6A41727ABBA0E858 ON appointments (clinic_session_id)');
        $this->addSql('CREATE INDEX idx_appointment_scheduled ON appointments (scheduled_at)');
        $this->addSql('CREATE INDEX idx_appointment_status ON appointments (status)');
        $this->addSql('COMMENT ON COLUMN appointments.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN appointments.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE educational_contents (id INT NOT NULL, author_id INT NOT NULL, title VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL, content_type VARCHAR(30) NOT NULL, language VARCHAR(10) NOT NULL, excerpt TEXT DEFAULT NULL, body TEXT NOT NULL, cover_image VARCHAR(255) DEFAULT NULL, media_url VARCHAR(255) DEFAULT NULL, is_published BOOLEAN NOT NULL, published_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, view_count INT NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_73825B06F675F31B ON educational_contents (author_id)');
        $this->addSql('COMMENT ON COLUMN educational_contents.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN educational_contents.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE feedbacks (id INT NOT NULL, author_id INT NOT NULL, target_type VARCHAR(30) NOT NULL, target_id INT DEFAULT NULL, rating INT NOT NULL, comment TEXT DEFAULT NULL, is_public BOOLEAN NOT NULL, is_moderated BOOLEAN NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_7E6C3F89F675F31B ON feedbacks (author_id)');
        $this->addSql('COMMENT ON COLUMN feedbacks.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE login_history (id INT NOT NULL, user_id INT NOT NULL, ip_address VARCHAR(45) NOT NULL, user_agent VARCHAR(255) DEFAULT NULL, device_type VARCHAR(100) DEFAULT NULL, success BOOLEAN NOT NULL, logged_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX idx_login_user ON login_history (user_id)');
        $this->addSql('CREATE INDEX idx_login_date ON login_history (logged_at)');
        $this->addSql('COMMENT ON COLUMN login_history.logged_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE medical_attachments (id INT NOT NULL, medical_record_id INT NOT NULL, file_name VARCHAR(255) NOT NULL, file_path VARCHAR(255) NOT NULL, mime_type VARCHAR(100) NOT NULL, file_size INT NOT NULL, attachment_type VARCHAR(50) NOT NULL, description TEXT DEFAULT NULL, uploaded_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_D53D3564B88E2BB6 ON medical_attachments (medical_record_id)');
        $this->addSql('COMMENT ON COLUMN medical_attachments.uploaded_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE medical_records (id INT NOT NULL, patient_id INT NOT NULL, appointment_id INT DEFAULT NULL, created_by_id INT NOT NULL, consultation_date DATE NOT NULL, chief_complaint TEXT DEFAULT NULL, observations TEXT DEFAULT NULL, right_eye_vision_uncorrected VARCHAR(20) DEFAULT NULL, right_eye_vision_corrected VARCHAR(20) DEFAULT NULL, right_eye_sphere NUMERIC(5, 2) DEFAULT NULL, right_eye_cylinder NUMERIC(5, 2) DEFAULT NULL, right_eye_axis INT DEFAULT NULL, left_eye_vision_uncorrected VARCHAR(20) DEFAULT NULL, left_eye_vision_corrected VARCHAR(20) DEFAULT NULL, left_eye_sphere NUMERIC(5, 2) DEFAULT NULL, left_eye_cylinder NUMERIC(5, 2) DEFAULT NULL, left_eye_axis INT DEFAULT NULL, pupillary_distance NUMERIC(4, 2) DEFAULT NULL, diagnosis TEXT DEFAULT NULL, treatment TEXT DEFAULT NULL, prescription TEXT DEFAULT NULL, recommendations TEXT DEFAULT NULL, next_visit_date DATE DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_DA9FB8886B899279 ON medical_records (patient_id)');
        $this->addSql('CREATE INDEX IDX_DA9FB888E5B533F9 ON medical_records (appointment_id)');
        $this->addSql('CREATE INDEX IDX_DA9FB888B03A8386 ON medical_records (created_by_id)');
        $this->addSql('COMMENT ON COLUMN medical_records.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN medical_records.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE mobile_clinic_sessions (id INT NOT NULL, lead_ophthalmologist_id INT DEFAULT NULL, location_name VARCHAR(255) NOT NULL, district VARCHAR(100) NOT NULL, commune VARCHAR(100) DEFAULT NULL, latitude NUMERIC(10, 7) DEFAULT NULL, longitude NUMERIC(10, 7) DEFAULT NULL, start_date TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, end_date TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, status VARCHAR(20) NOT NULL, max_appointments INT NOT NULL, notes TEXT DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_A34F97F8A4C341E9 ON mobile_clinic_sessions (lead_ophthalmologist_id)');
        $this->addSql('COMMENT ON COLUMN mobile_clinic_sessions.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE notifications (id INT NOT NULL, user_id INT NOT NULL, type VARCHAR(50) NOT NULL, channel VARCHAR(20) NOT NULL, title VARCHAR(255) NOT NULL, message TEXT NOT NULL, data JSON DEFAULT NULL, is_read BOOLEAN NOT NULL, is_sent BOOLEAN NOT NULL, sent_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, read_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_6000B0D3A76ED395 ON notifications (user_id)');
        $this->addSql('CREATE INDEX idx_notification_user_read ON notifications (user_id, is_read)');
        $this->addSql('COMMENT ON COLUMN notifications.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE order_items (id INT NOT NULL, order_id INT NOT NULL, product_id INT NOT NULL, product_name_snapshot VARCHAR(255) NOT NULL, quantity INT NOT NULL, unit_price_mga INT NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_62809DB08D9F6D38 ON order_items (order_id)');
        $this->addSql('CREATE INDEX IDX_62809DB04584665A ON order_items (product_id)');
        $this->addSql('CREATE TABLE orders (id INT NOT NULL, patient_id INT NOT NULL, related_medical_record_id INT DEFAULT NULL, order_number VARCHAR(50) NOT NULL, status VARCHAR(30) NOT NULL, subtotal_mga INT NOT NULL, shipping_fee_mga INT NOT NULL, total_mga INT NOT NULL, delivery_address VARCHAR(255) NOT NULL, delivery_district VARCHAR(100) DEFAULT NULL, delivery_phone VARCHAR(20) NOT NULL, delivery_notes TEXT DEFAULT NULL, shipped_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, delivered_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_E52FFDEE551F0F81 ON orders (order_number)');
        $this->addSql('CREATE INDEX IDX_E52FFDEE6B899279 ON orders (patient_id)');
        $this->addSql('CREATE INDEX IDX_E52FFDEEE7C99C4E ON orders (related_medical_record_id)');
        $this->addSql('COMMENT ON COLUMN orders.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN orders.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE payments (id INT NOT NULL, order_id INT DEFAULT NULL, appointment_id INT DEFAULT NULL, payer_id INT NOT NULL, reference VARCHAR(50) NOT NULL, amount_mga INT NOT NULL, method VARCHAR(30) NOT NULL, status VARCHAR(30) NOT NULL, external_transaction_id VARCHAR(100) DEFAULT NULL, payer_phone VARCHAR(20) DEFAULT NULL, provider_response JSON DEFAULT NULL, completed_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, failure_reason TEXT DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_65D29B32AEA34913 ON payments (reference)');
        $this->addSql('CREATE INDEX IDX_65D29B328D9F6D38 ON payments (order_id)');
        $this->addSql('CREATE INDEX IDX_65D29B32E5B533F9 ON payments (appointment_id)');
        $this->addSql('CREATE INDEX IDX_65D29B32C17AD9A9 ON payments (payer_id)');
        $this->addSql('CREATE INDEX idx_payment_status ON payments (status)');
        $this->addSql('CREATE INDEX idx_payment_ext_id ON payments (external_transaction_id)');
        $this->addSql('COMMENT ON COLUMN payments.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN payments.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE products (id INT NOT NULL, sku VARCHAR(100) NOT NULL, name VARCHAR(255) NOT NULL, description TEXT DEFAULT NULL, category VARCHAR(30) NOT NULL, brand VARCHAR(100) DEFAULT NULL, price_mga INT NOT NULL, stock_quantity INT NOT NULL, stock_alert_threshold INT NOT NULL, images JSON DEFAULT NULL, specifications JSON DEFAULT NULL, is_active BOOLEAN NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_B3BA5A5AF9038C4 ON products (sku)');
        $this->addSql('COMMENT ON COLUMN products.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN products.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE teleexpertise_requests (id INT NOT NULL, medical_record_id INT NOT NULL, requested_by_id INT NOT NULL, assigned_to_id INT DEFAULT NULL, question TEXT NOT NULL, urgency VARCHAR(20) NOT NULL, status VARCHAR(20) NOT NULL, response TEXT DEFAULT NULL, responded_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_502FC7C8B88E2BB6 ON teleexpertise_requests (medical_record_id)');
        $this->addSql('CREATE INDEX IDX_502FC7C84DA1E751 ON teleexpertise_requests (requested_by_id)');
        $this->addSql('CREATE INDEX IDX_502FC7C8F4BD7827 ON teleexpertise_requests (assigned_to_id)');
        $this->addSql('COMMENT ON COLUMN teleexpertise_requests.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN teleexpertise_requests.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE appointments ADD CONSTRAINT FK_6A41727A6B899279 FOREIGN KEY (patient_id) REFERENCES patients (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE appointments ADD CONSTRAINT FK_6A41727A3F25AA26 FOREIGN KEY (ophthalmologist_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE appointments ADD CONSTRAINT FK_6A41727ABBA0E858 FOREIGN KEY (clinic_session_id) REFERENCES mobile_clinic_sessions (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE educational_contents ADD CONSTRAINT FK_73825B06F675F31B FOREIGN KEY (author_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE feedbacks ADD CONSTRAINT FK_7E6C3F89F675F31B FOREIGN KEY (author_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE login_history ADD CONSTRAINT FK_37976E36A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE medical_attachments ADD CONSTRAINT FK_D53D3564B88E2BB6 FOREIGN KEY (medical_record_id) REFERENCES medical_records (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE medical_records ADD CONSTRAINT FK_DA9FB8886B899279 FOREIGN KEY (patient_id) REFERENCES patients (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE medical_records ADD CONSTRAINT FK_DA9FB888E5B533F9 FOREIGN KEY (appointment_id) REFERENCES appointments (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE medical_records ADD CONSTRAINT FK_DA9FB888B03A8386 FOREIGN KEY (created_by_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE mobile_clinic_sessions ADD CONSTRAINT FK_A34F97F8A4C341E9 FOREIGN KEY (lead_ophthalmologist_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE notifications ADD CONSTRAINT FK_6000B0D3A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE order_items ADD CONSTRAINT FK_62809DB08D9F6D38 FOREIGN KEY (order_id) REFERENCES orders (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE order_items ADD CONSTRAINT FK_62809DB04584665A FOREIGN KEY (product_id) REFERENCES products (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE orders ADD CONSTRAINT FK_E52FFDEE6B899279 FOREIGN KEY (patient_id) REFERENCES patients (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE orders ADD CONSTRAINT FK_E52FFDEEE7C99C4E FOREIGN KEY (related_medical_record_id) REFERENCES medical_records (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE payments ADD CONSTRAINT FK_65D29B328D9F6D38 FOREIGN KEY (order_id) REFERENCES orders (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE payments ADD CONSTRAINT FK_65D29B32E5B533F9 FOREIGN KEY (appointment_id) REFERENCES appointments (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE payments ADD CONSTRAINT FK_65D29B32C17AD9A9 FOREIGN KEY (payer_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE teleexpertise_requests ADD CONSTRAINT FK_502FC7C8B88E2BB6 FOREIGN KEY (medical_record_id) REFERENCES medical_records (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE teleexpertise_requests ADD CONSTRAINT FK_502FC7C84DA1E751 FOREIGN KEY (requested_by_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE teleexpertise_requests ADD CONSTRAINT FK_502FC7C8F4BD7827 FOREIGN KEY (assigned_to_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE patients DROP CONSTRAINT patients_user_id_fkey');
        $this->addSql('ALTER TABLE patients ALTER id DROP DEFAULT');
        $this->addSql('ALTER TABLE patients ADD CONSTRAINT FK_2CCC2E2CA76ED395 FOREIGN KEY (user_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER INDEX patients_patient_number_key RENAME TO UNIQ_2CCC2E2C9DDEF6AE');
        $this->addSql('ALTER INDEX patients_user_id_key RENAME TO UNIQ_2CCC2E2CA76ED395');
        $this->addSql('ALTER TABLE users ALTER id DROP DEFAULT');
        $this->addSql('ALTER TABLE users ALTER preferred_language DROP DEFAULT');
        $this->addSql('ALTER TABLE users ALTER email_verified DROP DEFAULT');
        $this->addSql('ALTER TABLE users ALTER phone_verified DROP DEFAULT');
        $this->addSql('ALTER TABLE users ALTER two_factor_enabled DROP DEFAULT');
        $this->addSql('ALTER TABLE users ALTER is_active DROP DEFAULT');
        $this->addSql('ALTER TABLE users ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('ALTER TABLE users ALTER created_at DROP DEFAULT');
        $this->addSql('ALTER TABLE users ALTER updated_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('ALTER TABLE users ALTER updated_at DROP DEFAULT');
        $this->addSql('COMMENT ON COLUMN users.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN users.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER INDEX users_email_key RENAME TO UNIQ_1483A5E9E7927C74');
        $this->addSql('ALTER INDEX users_phone_key RENAME TO UNIQ_1483A5E9444F97DD');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('DROP SEQUENCE appointments_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE educational_contents_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE feedbacks_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE login_history_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE medical_attachments_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE medical_records_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE mobile_clinic_sessions_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE notifications_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE order_items_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE orders_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE payments_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE products_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE teleexpertise_requests_id_seq CASCADE');
        $this->addSql('ALTER TABLE appointments DROP CONSTRAINT FK_6A41727A6B899279');
        $this->addSql('ALTER TABLE appointments DROP CONSTRAINT FK_6A41727A3F25AA26');
        $this->addSql('ALTER TABLE appointments DROP CONSTRAINT FK_6A41727ABBA0E858');
        $this->addSql('ALTER TABLE educational_contents DROP CONSTRAINT FK_73825B06F675F31B');
        $this->addSql('ALTER TABLE feedbacks DROP CONSTRAINT FK_7E6C3F89F675F31B');
        $this->addSql('ALTER TABLE login_history DROP CONSTRAINT FK_37976E36A76ED395');
        $this->addSql('ALTER TABLE medical_attachments DROP CONSTRAINT FK_D53D3564B88E2BB6');
        $this->addSql('ALTER TABLE medical_records DROP CONSTRAINT FK_DA9FB8886B899279');
        $this->addSql('ALTER TABLE medical_records DROP CONSTRAINT FK_DA9FB888E5B533F9');
        $this->addSql('ALTER TABLE medical_records DROP CONSTRAINT FK_DA9FB888B03A8386');
        $this->addSql('ALTER TABLE mobile_clinic_sessions DROP CONSTRAINT FK_A34F97F8A4C341E9');
        $this->addSql('ALTER TABLE notifications DROP CONSTRAINT FK_6000B0D3A76ED395');
        $this->addSql('ALTER TABLE order_items DROP CONSTRAINT FK_62809DB08D9F6D38');
        $this->addSql('ALTER TABLE order_items DROP CONSTRAINT FK_62809DB04584665A');
        $this->addSql('ALTER TABLE orders DROP CONSTRAINT FK_E52FFDEE6B899279');
        $this->addSql('ALTER TABLE orders DROP CONSTRAINT FK_E52FFDEEE7C99C4E');
        $this->addSql('ALTER TABLE payments DROP CONSTRAINT FK_65D29B328D9F6D38');
        $this->addSql('ALTER TABLE payments DROP CONSTRAINT FK_65D29B32E5B533F9');
        $this->addSql('ALTER TABLE payments DROP CONSTRAINT FK_65D29B32C17AD9A9');
        $this->addSql('ALTER TABLE teleexpertise_requests DROP CONSTRAINT FK_502FC7C8B88E2BB6');
        $this->addSql('ALTER TABLE teleexpertise_requests DROP CONSTRAINT FK_502FC7C84DA1E751');
        $this->addSql('ALTER TABLE teleexpertise_requests DROP CONSTRAINT FK_502FC7C8F4BD7827');
        $this->addSql('DROP TABLE appointments');
        $this->addSql('DROP TABLE educational_contents');
        $this->addSql('DROP TABLE feedbacks');
        $this->addSql('DROP TABLE login_history');
        $this->addSql('DROP TABLE medical_attachments');
        $this->addSql('DROP TABLE medical_records');
        $this->addSql('DROP TABLE mobile_clinic_sessions');
        $this->addSql('DROP TABLE notifications');
        $this->addSql('DROP TABLE order_items');
        $this->addSql('DROP TABLE orders');
        $this->addSql('DROP TABLE payments');
        $this->addSql('DROP TABLE products');
        $this->addSql('DROP TABLE teleexpertise_requests');
        $this->addSql('ALTER TABLE patients DROP CONSTRAINT FK_2CCC2E2CA76ED395');
        $this->addSql('CREATE SEQUENCE patients_id_seq');
        $this->addSql('SELECT setval(\'patients_id_seq\', (SELECT MAX(id) FROM patients))');
        $this->addSql('ALTER TABLE patients ALTER id SET DEFAULT nextval(\'patients_id_seq\')');
        $this->addSql('ALTER TABLE patients ADD CONSTRAINT patients_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER INDEX uniq_2ccc2e2c9ddef6ae RENAME TO patients_patient_number_key');
        $this->addSql('ALTER INDEX uniq_2ccc2e2ca76ed395 RENAME TO patients_user_id_key');
        $this->addSql('CREATE SEQUENCE users_id_seq');
        $this->addSql('SELECT setval(\'users_id_seq\', (SELECT MAX(id) FROM users))');
        $this->addSql('ALTER TABLE users ALTER id SET DEFAULT nextval(\'users_id_seq\')');
        $this->addSql('ALTER TABLE users ALTER preferred_language SET DEFAULT \'fr\'');
        $this->addSql('ALTER TABLE users ALTER email_verified SET DEFAULT false');
        $this->addSql('ALTER TABLE users ALTER phone_verified SET DEFAULT false');
        $this->addSql('ALTER TABLE users ALTER two_factor_enabled SET DEFAULT false');
        $this->addSql('ALTER TABLE users ALTER is_active SET DEFAULT true');
        $this->addSql('ALTER TABLE users ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('ALTER TABLE users ALTER created_at SET DEFAULT \'now()\'');
        $this->addSql('ALTER TABLE users ALTER updated_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('ALTER TABLE users ALTER updated_at SET DEFAULT \'now()\'');
        $this->addSql('COMMENT ON COLUMN users.created_at IS NULL');
        $this->addSql('COMMENT ON COLUMN users.updated_at IS NULL');
        $this->addSql('ALTER INDEX uniq_1483a5e9e7927c74 RENAME TO users_email_key');
        $this->addSql('ALTER INDEX uniq_1483a5e9444f97dd RENAME TO users_phone_key');
    }
}
