import * as https from '../../constant/https.js';
import prisma from '../../config/prisma.config.js';
import appAssert from '../../Utils/appAssert.js';
import isInDatabase from '../../Utils/IsInDatabase.js';

export const createFactureHandler = async (req, res) => {
  try {
    const request = req.body;
    if (!request.matricule) {
      request.matricule = 'NEAN';
    }

    appAssert(
      request.description,
      https.BAD_REQUEST,
      'Le champes description est obligatoire',
    );

    const id = parseInt(req.params.id);
    appAssert(!isNaN(id), https.BAD_REQUEST, "Cet factures n'existe pas");

    const date = new Date();
    let year = date.getFullYear();

    //ON verifie si le client existe dans la base de donnée
    const client = await isInDatabase(prisma.client, id);
    appAssert(
      client,
      https.NOT_FOUND,
      "Ce facture n'est pas enregistrer dans la base de donnee",
    );
    //On initialise le numero de la facture
    const num = `FACTURE-${year}_${client.id}/ `;

    // **on recuperer les factures de ce client */
    const clientFact = await prisma.facture.findMany({
      where: { clientId: id },
    });

    // Si le client n'a pas de facture on cree le premier facture pour ce clients
    if (clientFact.length === 0) {
      const numFacture = `${num}1`;
      //  **On enregistre le premier facture entreprice*/
      const newFacture = await prisma.facture.create({
        data: {
          numFacture,
          clientId: id,
          matricule: request.matricule.trim(),
          description: request.description.trim(),
        },
      });
      return res.status(https.CREATED).json({
        message: 'La Facture du client à été créer avec succes!',
        newFacture,
      });
    } else {
      //  Si le client a déja des facture
      //  On recuperer le numero de la derniere facture
      const lastFact = await prisma.facture.findMany({
        where: { clientId: id },
        orderBy: { createAt: 'desc' },
        select: { numFacture: true },
        take: 1,
      });
      //  **On incremente le dernier numero du derniere devis pour  */
      const numFacture = `${num}${parseInt(lastFact[0].numFacture[lastFact[0].numFacture.length - 1]) + 1}`;
      //  **On cree le devis suivant */
      const nextFacture = await prisma.facture.create({
        data: {
          numFacture,
          clientId: id,
          matricule: request.matricule,
          description: request.description,
        },
      });
      return res.status(https.CREATED).json({
        message: 'La facture du client à été créer avec succes!',
        nextFacture,
      });
    }
  } catch (error) {
    res.status(https.BAD_REQUEST).json({ error: error.message });
  }
};

export const getAllFacturesHandler = async (req, res) => {
  try {
    const allFacture = await prisma.facture.findMany();
    if (allFacture.length === 0) {
      return res.status(https.NOT_FOUND).json({
        message: 'Aucune facture dans la basse de donnée!',
      });
    }
    return res
      .status(https.OK)
      .json({ quantity: allFacture.length, data: allFacture });
  } catch (error) {
    res.status(https.BAD_REQUEST).json({ error: error.message });
  }
};

export const getFacturesHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    appAssert(!isNaN(id), https.BAD_REQUEST, "Ce facture n'existe pas");

    //**On verifie si la factures existe */
    const facture = await prisma.facture.findUnique({
      where: { id },
      include: {
        factureItem: {
          select: {
            itemId: true,
            description: true,
            quantity: true,
            unitePrice: true,
            total: true,
          },
        },
        clientFacture: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            addresse: true,
          },
        },
      },
    });
    appAssert(
      facture,
      https.NOT_FOUND,
      "Ce facture n'est pas enregistrer dans la base de donnee",
    );

    return res.status(https.OK).json({ data: facture });
  } catch (error) {
    res.status(https.BAD_REQUEST).json({ error: error.message });
  }
};

export const updateFactureHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    appAssert(!isNaN(id), https.BAD_REQUEST, "Ce facture n'existe pas");
    const request = req.body;
    if (!request.matricule) {
      request.matricule = 'NEAN';
    }
    appAssert(
      request.description,
      https.BAD_REQUEST,
      'le champes description est obligatoire',
    );

    //On verifie si la facture existe dans la basse de donné
    const facture = await prisma.facture.findUnique({ where: { id } });
    appAssert(
      facture,
      https.NOT_FOUND,
      "Ce facture n'est pas enregistrer dans la base de donnee",
    );
    //on met a jour les données de la facture
    const upfact = await prisma.facture.update({
      where: { id },
      data: {
        matricule: request.matricule.trim(),
        description: request.description.trim(),
      },
    });
    return res.status(https.OK).json({
      success: true,
      message: 'Facture Mise à jour avec succes',
      data: upfact,
    });
  } catch (error) {
    res.status(https.BAD_REQUEST).json({ error: error.message });
  }
};

export const deleteFactureHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    appAssert(!isNaN(id), https.BAD_REQUEST, "Ce facture n'existe pas");

    //on verifie si la facture existe dans la basse de donné
    const facture = await prisma.facture.findUnique({ where: { id } });
    appAssert(
      facture,
      https.NOT_FOUND,
      "Ce facture n'est pas enregistrer dans la base de donnee",
    );
    //on supprime la facture
    await prisma.facture.delete({ where: { id } });
    return res.status(https.OK).json({
      message: 'Facture Supprimer avec succes',
    });
  } catch (error) {
    res.status(https.BAD_REQUEST).json({ error: error.message });
  }
};
