import {
  postHangout,
  postPhotoToHangout,
  getHangout,
} from "../../controllers/HangoutController";
import * as HangoutService from "../../services/HangoutService";

jest.mock("../../services/HangoutService", () => ({
  createHangout: jest.fn(),
  addPhotoToHangout: jest.fn(),
  fetchHangout: jest.fn(),
}));

const res = {
  status: jest.fn().mockReturnThis(),
  send: jest.fn(),
  json: jest.fn(),
};

describe("postHangout Controller", () => {
  it("should send a status of 201 and the hangoutId", async () => {
    const req = {
      body: {
        userId: "user123",
        completed: false,
        hangoutDetails: "Hangout Details",
      },
    };

    HangoutService.createHangout.mockResolvedValue({
      hangoutId: "hangout123",
    });

    await postHangout(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      result: {
        hangoutId: "hangout123",
      },
    });
  });

  it("should send a status of 500 and the error message", async () => {
    const req = {
      body: {
        userId: "user123",
        completed: false,
        hangoutDetails: "Hangout Details",
      },
    };

    HangoutService.createHangout.mockRejectedValue(
      new Error("Invalid Request")
    );

    await postHangout(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      message: "Invalid Request",
    });
  });
});

describe("postPhotoToHangout Controller", () => {
  it("should send a status of 201 and the hangoutId", async () => {
    const req = {
      params: {
        id: "hangout123",
      },
      body: {
        takenBy: "user123",
        takenAt: new Date().toISOString(),
      },
      file: {
        buffer: Buffer.from("mockPhoto", "utf-8"),
        originalname: "photo.jpg",
      },
    };

    HangoutService.addPhotoToHangout.mockResolvedValue({
      hangoutId: "hangout123",
    });

    await postPhotoToHangout(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      result: {
        hangoutId: "hangout123",
      },
    });
  });

  it("should send a status of 500 and error message", async () => {
    const req = {
      params: {
        id: "hangout123",
      },
      body: {
        takenBy: "user123",
        takenAt: new Date().toISOString(),
      },
      file: {
        buffer: Buffer.from("mockPhoto", "utf-8"),
        originalname: "photo.jpg",
      },
    };

    HangoutService.addPhotoToHangout.mockRejectedValue(
      new Error("Invalid Request")
    );

    await postPhotoToHangout(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      message: "Invalid Request",
    });
  });
});

describe("getHangout Controller", () => {
  it("should send a status of 200 and the hangout data", async () => {
    const req = {
      params: {
        id: "hangout123",
      },
    };

    HangoutService.fetchHangout.mockResolvedValue({
      completed: false,
      createdAt: "Date",
      hangoutDetails: "Details",
      participantIds: ["user123"],
      sharedAlbum: ["Photo1", "Photo2"],
    });

    await getHangout(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      completed: false,
      createdAt: "Date",
      hangoutDetails: "Details",
      participantIds: ["user123"],
      sharedAlbum: ["Photo1", "Photo2"],
    });
  });

  it("should send a status of 500 and error message", async () => {
    const req = {
      params: {
        id: "hangout123",
      },
    };

    HangoutService.fetchHangout.mockRejectedValue(new Error("Invalid Request"));

    await getHangout(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      message: "Invalid Request",
    });
  });
});
