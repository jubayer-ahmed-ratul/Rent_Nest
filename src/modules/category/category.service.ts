import { prisma } from "../../lib/prisma";
import { createCategoryPayload } from "./category.interface";

const getAllCategoriesFromDB = async () => {
  return await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
};

const createCategoryIntoDB = async (payload: createCategoryPayload) => {
  const isExist = await prisma.category.findUnique({
    where: { name: payload.name },
  });
  if (isExist) throw new Error("Category already exists");

  return await prisma.category.create({ data: payload });
};

export const categoryService = {
  getAllCategoriesFromDB,
  createCategoryIntoDB,
};
