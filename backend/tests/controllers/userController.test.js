import { postUser } from "../../controllers/UserController";
import * as UserService from "../../services/UserService";

jest.mock("../../services/UserService", () => ({
  createUser: jest.fn(),
}));

const res = {
  status: jest.fn().mockReturnThis(),
  send: jest.fn(),
};

describe("postUser Controller", () => {
  it("should send a status of 201 and a message of user created", async () => {
    const req = {
      body: {
        email: "zippy.zhu@gmail.com",
      },
    };

    UserService.createUser.mockResolvedValue({
      userId: "user123",
      message: "User logged in",
    });

    await postUser(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      result: {
        userId: "user123",
        message: "User logged in",
      },
    });
  });

  it("should send a status of 500 and an error message", async () => {
    const req = {
      body: {
        email: "zippy.zhu@gmail.com",
      },
    };

    UserService.createUser.mockRejectedValue(new Error("Invalid Request"));

    await postUser(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      message: "Invalid Request",
    });
  });
});
