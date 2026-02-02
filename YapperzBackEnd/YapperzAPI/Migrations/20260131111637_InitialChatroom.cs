using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YapperzAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialChatroom : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_ChatRoom_RoomId",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ChatRoom",
                table: "ChatRoom");

            migrationBuilder.RenameTable(
                name: "ChatRoom",
                newName: "Chatrooms");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Chatrooms",
                table: "Chatrooms",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Chatrooms_RoomId",
                table: "Users",
                column: "RoomId",
                principalTable: "Chatrooms",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Chatrooms_RoomId",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Chatrooms",
                table: "Chatrooms");

            migrationBuilder.RenameTable(
                name: "Chatrooms",
                newName: "ChatRoom");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ChatRoom",
                table: "ChatRoom",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_ChatRoom_RoomId",
                table: "Users",
                column: "RoomId",
                principalTable: "ChatRoom",
                principalColumn: "Id");
        }
    }
}
